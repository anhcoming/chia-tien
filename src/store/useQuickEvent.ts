import { useEffect, useMemo, useReducer } from 'react';
import type { BankAccount, EventData, Expense, Member } from '../core';
import { uid } from '../utils/id';
import { loadQuickEvent, saveQuickEvent } from './storage';

const now = () => Date.now();

export function createEmptyEvent(): EventData {
  return { id: uid('ev_'), name: '', members: [], expenses: [], createdAt: now(), updatedAt: now() };
}

type Action =
  | { type: 'reset' }
  | { type: 'load'; event: EventData }
  | { type: 'setName'; name: string }
  | { type: 'addMember'; name: string }
  | { type: 'renameMember'; id: string; name: string }
  | { type: 'removeMember'; id: string }
  | { type: 'setMemberBank'; id: string; bank: BankAccount | null }
  | { type: 'addExpense'; expense: Omit<Expense, 'id'> }
  | { type: 'updateExpense'; id: string; expense: Omit<Expense, 'id'> }
  | { type: 'removeExpense'; id: string };

const touch = (s: EventData): EventData => ({ ...s, updatedAt: now() });

/** Gỡ một thành viên khỏi phần chia của khoản chi (giữ cho dữ liệu nhất quán). */
function removeMemberFromSplit(e: Expense, id: string): Expense {
  const { split } = e;
  if (split.mode === 'equal') {
    return { ...e, split: { mode: 'equal', participants: split.participants.filter((p) => p !== id) } };
  }
  if (split.mode === 'shares') {
    const shares = { ...split.shares };
    delete shares[id];
    return { ...e, split: { mode: 'shares', shares } };
  }
  const amounts = { ...split.amounts };
  delete amounts[id];
  return { ...e, split: { mode: 'exact', amounts } };
}

function reducer(state: EventData, action: Action): EventData {
  switch (action.type) {
    case 'reset':
      return createEmptyEvent();
    case 'load':
      return action.event;
    case 'setName':
      return touch({ ...state, name: action.name });
    case 'addMember': {
      const name = action.name.trim();
      if (!name) return state;
      const member: Member = { id: uid('m_'), name };
      return touch({ ...state, members: [...state.members, member] });
    }
    case 'renameMember':
      return touch({
        ...state,
        members: state.members.map((m) => (m.id === action.id ? { ...m, name: action.name } : m)),
      });
    case 'removeMember': {
      const members = state.members.filter((m) => m.id !== action.id);
      const expenses = state.expenses
        .filter((e) => e.payerId !== action.id)
        .map((e) => removeMemberFromSplit(e, action.id));
      return touch({ ...state, members, expenses });
    }
    case 'setMemberBank':
      return touch({
        ...state,
        members: state.members.map((m) =>
          m.id === action.id ? { ...m, bank: action.bank ?? undefined } : m,
        ),
      });
    case 'addExpense':
      return touch({ ...state, expenses: [...state.expenses, { ...action.expense, id: uid('e_') }] });
    case 'updateExpense':
      return touch({
        ...state,
        expenses: state.expenses.map((e) => (e.id === action.id ? { ...action.expense, id: action.id } : e)),
      });
    case 'removeExpense':
      return touch({ ...state, expenses: state.expenses.filter((e) => e.id !== action.id) });
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

/**
 * Quản lý trạng thái nhóm "Tính nhanh" + tự lưu localStorage. Auto-load khi mở app.
 */
export function useQuickEvent() {
  const [event, dispatch] = useReducer(reducer, undefined, () => loadQuickEvent() ?? createEmptyEvent());

  useEffect(() => {
    saveQuickEvent(event);
  }, [event]);

  const actions = useMemo(
    () => ({
      reset: () => dispatch({ type: 'reset' }),
      loadEvent: (e: EventData) => dispatch({ type: 'load', event: e }),
      setName: (name: string) => dispatch({ type: 'setName', name }),
      addMember: (name: string) => dispatch({ type: 'addMember', name }),
      renameMember: (id: string, name: string) => dispatch({ type: 'renameMember', id, name }),
      removeMember: (id: string) => dispatch({ type: 'removeMember', id }),
      setMemberBank: (id: string, bank: BankAccount | null) => dispatch({ type: 'setMemberBank', id, bank }),
      addExpense: (expense: Omit<Expense, 'id'>) => dispatch({ type: 'addExpense', expense }),
      updateExpense: (id: string, expense: Omit<Expense, 'id'>) => dispatch({ type: 'updateExpense', id, expense }),
      removeExpense: (id: string) => dispatch({ type: 'removeExpense', id }),
    }),
    [],
  );

  return { event, actions };
}
