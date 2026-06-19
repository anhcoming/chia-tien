import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Member } from '../../core';
import { Avatar } from '../../components/Avatar';

interface Props {
  members: Member[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}

export function MembersCard({ members, onAdd, onRemove }: Props) {
  const [name, setName] = useState('');

  function submit(e: FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    onAdd(n);
    setName('');
  }

  return (
    <section className="card card--pad">
      <div className="section-title">Thành viên ({members.length})</div>

      {members.length === 0 ? (
        <p className="muted" style={{ marginBottom: 'var(--sp-3)' }}>
          Thêm tên những người cùng chia tiền.
        </p>
      ) : (
        <div className="chips" style={{ marginBottom: 'var(--sp-3)' }}>
          {members.map((m) => (
            <span className="chip" key={m.id}>
              <Avatar name={m.name} size={26} />
              {m.name}
              <button className="chip__x" onClick={() => onRemove(m.id)} aria-label={`Xoá ${m.name}`}>
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <form className="row" onSubmit={submit}>
        <input
          className="input grow"
          value={name}
          placeholder="Tên thành viên…"
          enterKeyHint="done"
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn btn--primary" type="submit" disabled={!name.trim()}>
          Thêm
        </button>
      </form>
    </section>
  );
}
