"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface DayEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  regularHours: number;
  driveHours: number;
  onSave: (regularHours: number, driveHours: number) => void;
  readOnly?: boolean;
}

export function DayEntryModal({
  isOpen,
  onClose,
  date,
  regularHours: initialReg,
  driveHours: initialDrive,
  onSave,
  readOnly = false,
}: DayEntryModalProps) {
  const [reg, setReg] = useState(initialReg);
  const [drive, setDrive] = useState(initialDrive);

  const total = (reg || 0) + (drive || 0);
  const isOver = total > 24;

  const handleSave = () => {
    if (isOver) return;
    onSave(reg || 0, drive || 0);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={format(date, "EEEE, MMMM d")}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Regular Hours
          </label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            max="24"
            step="0.25"
            value={reg || ""}
            placeholder="0"
            disabled={readOnly}
            onChange={(e) => setReg(parseFloat(e.target.value) || 0)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg py-3 text-center"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Drive Hours
          </label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            max="24"
            step="0.25"
            value={drive || ""}
            placeholder="0"
            disabled={readOnly}
            onChange={(e) => setDrive(parseFloat(e.target.value) || 0)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg py-3 text-center text-blue-700"
          />
        </div>

        <div className="bg-gray-50 rounded-md p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total hours:</span>
            <span className={`font-semibold ${isOver ? "text-red-600" : "text-gray-900"}`}>
              {total.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Per diem:</span>
            <span className="font-semibold text-green-600">
              {total > 0 ? "Yes" : "No"}
            </span>
          </div>
        </div>

        {isOver && (
          <p className="text-sm text-red-600">
            Total hours cannot exceed 24 per day.
          </p>
        )}

        {!readOnly && (
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={isOver}>
              Save
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
