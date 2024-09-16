// src/controllers/ticketController.ts

import { cwm } from '../services/connectwiseService';

// Helper class to build query conditions
class ConditionBuilder {
  private conditions: string[] = [];

  addCondition(field: string, operator: string, value: any): ConditionBuilder {
    let formattedValue: string;

    if (value === null) {
      formattedValue = 'null';
    } else if (typeof value === 'boolean') {
      formattedValue = value.toString();
    } else if (typeof value === 'number') {
      formattedValue = value.toString();
    } else if (typeof value === 'string') {
      formattedValue = `"${value.replace(/"/g, '\\"')}"`;
    } else if (value instanceof Date) {
      formattedValue = `[${value.toISOString()}]`;
    } else {
      throw new Error(`Unsupported value type: ${typeof value}`);
    }

    this.conditions.push(`${field} ${operator} ${formattedValue}`);
    return this;
  }

  addLikeCondition(field: string, value: string): ConditionBuilder {
    const formattedValue = `"${value.replace(/"/g, '\\"')}%"`;
    this.conditions.push(`${field} like ${formattedValue}`);
    return this;
  }

  addContainsCondition(field: string, value: string): ConditionBuilder {
    const formattedValue = `"${value.replace(/"/g, '\\"')}"`;
    this.conditions.push(`${field} contains ${formattedValue}`);
    return this;
  }

  addInCondition(field: string, values: string[]): ConditionBuilder {
    const formattedValues = values.map((val) => `"${val.replace(/"/g, '\\"')}"`).join(',');
    this.conditions.push(`${field} in (${formattedValues})`);
    return this;
  }

  addNotInCondition(field: string, values: string[]): ConditionBuilder {
    const formattedValues = values.map((val) => `"${val.replace(/"/g, '\\"')}"`).join(',');
    this.conditions.push(`${field} not in (${formattedValues})`);
    return this;
  }

  build(): string {
    return this.conditions.join(' AND ');
  }
}

// Fetch a ticket by its ID
export async function getTicketById(ticketId: number) {
  try {
    const ticket = await cwm.ServiceDeskAPI.Tickets.getTicketById(ticketId);
    return ticket;
  } catch (error) {
    throw new Error(`Unable to fetch ticket with ID ${ticketId}: ${(error as Error).message}`);
  }
}

// Fetch open tickets based on predefined conditions
export async function getOpenTickets() {
  const conditionBuilder = new ConditionBuilder();

  conditionBuilder
    .addCondition('board/name', '=', 'SMB Services - SMB Team 1 Support')
    .addNotInCondition('status/name', ['Closed', 'Admin Closed', 'Complete', 'Canceled', 'Closed/No Response'])
    .addCondition('resources', '=', '')
    .addCondition('parentTicketId', '=', null);

  const conditions = conditionBuilder.build();

  try {
    const tickets = await cwm.ServiceDeskAPI.Tickets.getTickets({
      conditions,
      page: 1,
      pageSize: 100,
    });
    return tickets;
  } catch (error) {
    throw new Error(`Unable to fetch open tickets: ${(error as Error).message}`);
  }
}

// Fetch tickets assigned to a specific resource
export async function getTicketsByResource(resource: string | null) {
  const conditionBuilder = new ConditionBuilder();

  conditionBuilder
    .addCondition('board/name', '=', 'SMB Services - SMB Team 1 Support')
    .addNotInCondition('status/name', ['Closed', 'Complete', 'Canceled']);

  if (resource) {
    conditionBuilder.addCondition('resources', 'like', resource);
  } else {
    conditionBuilder.addCondition('resources', '=', '');
  }

  const conditions = conditionBuilder.build();

  try {
    const tickets = await cwm.ServiceDeskAPI.Tickets.getTickets({
      conditions,
      page: 1,
      pageSize: 100,
    });
    return tickets;
  } catch (error) {
    throw new Error(`Unable to fetch tickets for resource ${resource || 'empty'}: ${(error as Error).message}`);
  }
}

// Fetch notes for a specific ticket
export async function getTicketNotes(ticketId: number) {
  try {
    const notes = await cwm.ServiceDeskAPI.TicketNotes.getTicketNotes(ticketId, {
      page: 1,
      pageSize: 100,
    });
    return notes;
  } catch (error) {
    throw new Error(`Unable to fetch notes for ticket ID ${ticketId}: ${(error as Error).message}`);
  }
}
