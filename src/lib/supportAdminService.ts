import { collection, addDoc, getDocs, doc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createAuditLog } from '@/lib/auditLogService';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketCategory = 'ACCOUNT' | 'TRADING' | 'WALLET' | 'TECHNICAL' | 'OTHER';

export interface TicketMessage {
  id: string;
  sender: 'USER' | 'ADMIN' | 'SYSTEM';
  senderName: string;
  text: string;
  timestamp: string;
  isInternalNote?: boolean;
}

export interface SupportTicket {
  id: string;
  uid: string;
  userEmail: string;
  userName: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  assignedAdmin?: string;
  messages: TicketMessage[];
}

const LOCAL_TICKETS_KEY = 'alphanxt_admin_support_tickets';

function getLocalTickets(): SupportTicket[] {
  try {
    const raw = localStorage.getItem(LOCAL_TICKETS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  // Initial seed tickets if empty
  const initialTickets: SupportTicket[] = [
    {
      id: 'TICK-9081',
      uid: 'user_mumbai_01',
      userEmail: 'arav.sharma@gmail.com',
      userName: 'Arav Sharma',
      subject: 'Discrepancy in Option Chain Margin Calculation',
      category: 'TRADING',
      priority: 'HIGH',
      status: 'OPEN',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      assignedAdmin: 'admin.alphanxt@gmail.com',
      messages: [
        {
          id: 'msg-1',
          sender: 'USER',
          senderName: 'Arav Sharma',
          text: 'Hello, I placed a NIFTY 24500 CE order during high volatility and noticed a small margin discrepancy in my virtual balance.',
          timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        },
      ],
    },
    {
      id: 'TICK-9082',
      uid: 'user_delhi_02',
      userEmail: 'priya.singh@yahoo.com',
      userName: 'Priya Singh',
      subject: 'Virtual Balance Refill Request',
      category: 'WALLET',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      assignedAdmin: 'admin.alphanxt@gmail.com',
      messages: [
        {
          id: 'msg-1',
          sender: 'USER',
          senderName: 'Priya Singh',
          text: 'Can I get my paper balance reset to ₹1,00,00,000 for testing a new algorithmic option strategy?',
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        },
        {
          id: 'msg-2',
          sender: 'ADMIN',
          senderName: 'Admin',
          text: 'Hello Priya, our team is reviewing your account history and will process a test refill shortly.',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ],
    },
  ];

  localStorage.setItem(LOCAL_TICKETS_KEY, JSON.stringify(initialTickets));
  return initialTickets;
}

function saveLocalTickets(tickets: SupportTicket[]) {
  try {
    localStorage.setItem(LOCAL_TICKETS_KEY, JSON.stringify(tickets));
  } catch (err) {
    console.error('Failed to save support tickets locally:', err);
  }
}

export async function fetchSupportTickets(): Promise<SupportTicket[]> {
  const localList = getLocalTickets();
  try {
    const snap = await getDocs(collection(db, 'support_tickets'));
    if (!snap.empty) {
      const list: SupportTicket[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as SupportTicket));
      return list;
    }
  } catch (err) {
    console.warn('Using local support tickets (Firestore fallback):', err);
  }
  return localList;
}

export async function updateTicketStatus(
  adminEmail: string,
  adminUid: string,
  ticketId: string,
  status: TicketStatus,
  reason: string,
): Promise<void> {
  const tickets = getLocalTickets();
  const index = tickets.findIndex((t) => t.id === ticketId);
  if (index !== -1) {
    tickets[index].status = status;
    tickets[index].updatedAt = new Date().toISOString();
    saveLocalTickets(tickets);
  }

  try {
    await updateDoc(doc(db, 'support_tickets', ticketId), {
      status,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail,
    });
  } catch {}

  await createAuditLog({
    adminEmail,
    adminUid,
    actionCategory: 'USER',
    actionName: `TICKET_STATUS_${status}`,
    targetUid: ticketId,
    reason,
    newState: status,
    details: `Updated support ticket ${ticketId} status to ${status}`,
  });
}

export async function addTicketReply(
  adminEmail: string,
  adminUid: string,
  ticketId: string,
  text: string,
  isInternalNote = false,
): Promise<void> {
  const tickets = getLocalTickets();
  const index = tickets.findIndex((t) => t.id === ticketId);
  if (index === -1) throw new Error('Ticket not found.');

  const newMsg: TicketMessage = {
    id: `msg-${Date.now()}`,
    sender: 'ADMIN',
    senderName: adminEmail.split('@')[0],
    text: text.trim(),
    timestamp: new Date().toISOString(),
    isInternalNote,
  };

  tickets[index].messages.push(newMsg);
  tickets[index].updatedAt = new Date().toISOString();
  saveLocalTickets(tickets);

  await createAuditLog({
    adminEmail,
    adminUid,
    actionCategory: 'NOTIFICATION',
    actionName: isInternalNote ? 'TICKET_INTERNAL_NOTE' : 'TICKET_REPLY',
    targetUid: ticketId,
    details: isInternalNote
      ? `Added internal note to ticket ${ticketId}`
      : `Replied to ticket ${ticketId}`,
  });
}
