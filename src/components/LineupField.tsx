'use client';

/**
 * Desenho de campo de futebol com posições da formação.
 * - Admin: cada posição tem select para escolher jogador
 * - Display: mostra nome do jogador em cada posição
 */

export interface SlotInfo {
  id: string;
  label: string;
  row: number;
  col: number;
  totalInRow: number;
}

// Formações: [goleiro, defesa, meio, ataque] - Campo/FUT7: 11, Futsal: 5
const FORMATIONS: Record<string, number[]> = {
  '4-3-3': [1, 4, 3, 3],
  '4-4-2': [1, 4, 4, 2],
  '4-2-3-1': [1, 4, 2, 3, 1],
  '3-5-2': [1, 3, 5, 2],
  '5-3-2': [1, 5, 3, 2],
  '4-5-1': [1, 4, 5, 1],
  '3-4-3': [1, 3, 4, 3],
  '1-2-1-1': [1, 2, 1, 1],
  '1-1-2-1': [1, 1, 2, 1],
  '1-3-1': [1, 3, 1],
  '1-2-2': [1, 2, 2],
  '1-3-2-1': [1, 3, 2, 1],
  '1-2-3-1': [1, 2, 3, 1],
  '1-2-2-2': [1, 2, 2, 2],
};

const ROW_LABELS = ['GOL', 'ZAG', 'MEI', 'ATA', 'MEI'];

export function getSlotsFromFormation(formacao: string, nPlayers: number): SlotInfo[] {
  const linhas = FORMATIONS[formacao] || (nPlayers === 5 ? [1, 2, 1] : [1, 4, 3, 3]);
  const slots: SlotInfo[] = [];
  let idx = 0;
  linhas.forEach((count, rowIndex) => {
    const label = ROW_LABELS[Math.min(rowIndex, ROW_LABELS.length - 1)];
    for (let c = 0; c < count; c++) {
      slots.push({
        id: `slot_${idx}`,
        label: count === 1 ? label : `${label} ${c + 1}`,
        row: rowIndex,
        col: c,
        totalInRow: count,
      });
      idx++;
    }
  });
  return slots.slice(0, nPlayers);
}

export function getFormationsForModalidade(modalidade: string): string[] {
  if (modalidade === 'futsal') return ['1-2-2', '1-3-1', '1-2-1-1', '1-1-2-1'];
  if (modalidade === 'fut7') return ['1-3-2-1', '1-2-3-1', '1-2-2-2'];
  return ['4-3-3', '4-4-2', '4-2-3-1', '3-4-3', '3-5-2', '5-3-2', '4-5-1'];
}

interface PlayerOption {
  id: string;
  nome: string;
  numero: number | null;
}

interface LineupFieldProps {
  formacao: string;
  modalidade: 'campo' | 'fut7' | 'futsal';
  mode: 'admin' | 'display';
  players: PlayerOption[];
  slotPlayers: Record<string, { id: string; nome: string; numero: number }>;
  slotLabels?: Record<string, string>;
  onSlotChange?: (slotId: string, playerId: string | null) => void;
  onLabelChange?: (slotId: string, label: string) => void;
}

export function LineupField({
  formacao,
  modalidade,
  mode,
  players,
  slotPlayers,
  slotLabels = {},
  onSlotChange,
  onLabelChange,
}: LineupFieldProps) {
  const nPlayers = modalidade === 'futsal' ? 5 : modalidade === 'fut7' ? 7 : 11;
  const slots = getSlotsFromFormation(formacao, nPlayers);

  const usedIds = new Set(Object.entries(slotPlayers).filter(([, p]) => p?.id).map(([, p]) => p.id));

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className="relative rounded-lg overflow-hidden border-2 border-green-700 bg-green-800/30"
        style={{ aspectRatio: '1.5' }}
      >
        {/* Linhas do campo */}
        <div className="absolute inset-0 flex flex-col justify-between py-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex-1 border-b border-green-600/50 last:border-0" />
          ))}
        </div>
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-green-600/50" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-green-600/50" />

        {/* Posições */}
        <div className="absolute inset-0 p-3 flex flex-col justify-between">
          {(() => {
            const rows: SlotInfo[][] = [];
            let currentRow = -1;
            slots.forEach((slot) => {
              if (slot.row !== currentRow) {
                currentRow = slot.row;
                rows.push([]);
              }
              rows[rows.length - 1].push(slot);
            });

            return rows.map((rowSlots, rowIdx) => (
              <div
                key={rowIdx}
                className="flex justify-center gap-2 sm:gap-4"
                style={{
                  justifyContent: 'space-evenly',
                  flex: rowSlots.length > 0 ? 1 : 0,
                }}
              >
                {rowSlots.map((slot) => {
                  const assigned = slotPlayers[slot.id];
                  const displayLabel = slotLabels[slot.id]?.trim() || slot.label;
                  return (
                    <div
                      key={slot.id}
                      className="flex flex-col items-center justify-center"
                      style={{ flex: 1, maxWidth: 140 }}
                    >
                      {mode === 'admin' ? (
                        <>
                          <select
                            value={assigned?.id || ''}
                            onChange={(e) => onSlotChange?.(slot.id, e.target.value || null)}
                            className="w-full max-w-[120px] px-2 py-1.5 text-xs sm:text-sm rounded-lg border-2 border-green-500 bg-white text-gray-900 font-medium text-center"
                          >
                            <option value="">— Escolher —</option>
                            {players.map((p) => (
                              <option
                                key={p.id}
                                value={p.id}
                                disabled={assigned?.id !== p.id && usedIds.has(p.id)}
                              >
                                #{p.numero ?? '?'} {p.nome}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={slotLabels[slot.id] ?? ''}
                            onChange={(e) => onLabelChange?.(slot.id, e.target.value)}
                            placeholder={slot.label}
                            className="w-full max-w-[120px] mt-1 px-2 py-0.5 text-[10px] rounded border border-green-600/50 bg-green-900/30 text-green-200 placeholder:text-green-600 text-center"
                          />
                        </>
                      ) : (
                        <>
                          <div className="w-full max-w-[120px] px-2 py-1.5 rounded-lg bg-green-900/60 border border-green-600/50 text-center">
                            <p className="text-xs text-green-300 font-semibold truncate">
                              {assigned ? `#${assigned.numero} ${assigned.nome}` : '—'}
                            </p>
                          </div>
                          <span className="text-[10px] text-green-400 mt-0.5">{displayLabel}</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
}
