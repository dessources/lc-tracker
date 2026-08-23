import type { SortKey } from "../types";

interface Props {
  sortKey: SortKey
  curSortKey: SortKey
  sortOrder: number
  onClick: React.MouseEventHandler<HTMLTableCellElement>
}

export function ProblemLibraryTh({ sortKey, curSortKey, sortOrder, onClick }: Props) {


  return (
    <th className="text-left px-4 py-2.5 text-xs text-secondary font-medium" onClick={onClick}>
      <span className="cursor-pointer hover:underline">{sortKey}</span>
      <span className="cursor-pointer">
        {(curSortKey != sortKey || sortOrder == 1 ? <span>{"\u25B2"}</span> : <></>)}
        {(curSortKey != sortKey || sortOrder == -1 ? <span>{"\u25BC"}</span> : <></>)}
      </span>
    </th>
  )
}