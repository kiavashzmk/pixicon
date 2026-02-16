import { memo } from 'react';
import './GridCell.css';

const GridCell = memo(function GridCell({ cell, isSelected, onToggle, onSelect }) {
  function handleClick(e) {
    e.stopPropagation();
    const multi = e.shiftKey || e.metaKey;
    if (!multi) {
      onToggle(cell.id);
    }
    onSelect(cell.id, { shift: e.shiftKey, meta: e.metaKey });
  }

  const style = cell.active
    ? { backgroundColor: cell.fill }
    : undefined;

  let className = 'grid-cell';
  if (cell.active) className += ' active';
  if (isSelected) className += ' selected';

  return (
    <div
      className={className}
      style={style}
      onClick={handleClick}
      data-cell-id={cell.id}
      title={`${cell.row}, ${cell.col}`}
    />
  );
});

export default GridCell;
