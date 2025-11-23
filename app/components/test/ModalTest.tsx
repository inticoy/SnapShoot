'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';

export function ModalTest() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 left-10 bg-purple-500 px-4 py-2 rounded z-50 hover:bg-purple-600"
      >
        Open Modal
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="flex-auto flex items-center justify-center">
          <div className="bg-white/10 p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Test Modal</h2>
            <p className="mb-4">This is a test modal</p>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
