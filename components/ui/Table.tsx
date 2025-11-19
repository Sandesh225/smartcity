

// FILE: components/ui/Table.tsx
import { ReactNode } from 'react';

type TableProps = {
  children: ReactNode;
};

export function Table({ children }: TableProps) {
  return (
    <div className="table-wrapper">
      <table className="table">{children}</table>
    </div>
  );
}
