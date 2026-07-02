/* ==========================================
   MODAL POPUP STYLES
   ========================================== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #1a3a5c 0%, #2c5aa0 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: white;
}

.modal-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  padding: 24px;
}

.modal-body .form-group {
  margin-bottom: 16px;
}

.modal-body .form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-body input,
.modal-body select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-primary);
  background: white;
  transition: all 0.2s;
}

.modal-body input:focus,
.modal-body select:focus {
  outline: none;
  border-color: var(--primary-light);
  box-shadow: 0 0 0 3px rgba(44, 90, 160, 0.1);
}

.modal-body .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 0;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #f5f7fa;
  border-radius: 0 0 12px 12px;
}

/* Task view toggle enhancement */
.task-view-toggle {
  display: flex;
  gap: 8px;
  padding: 15px 20px;
  background: white;
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
}

.task-view-toggle button {
  padding: 10px 20px;
  background: white;
  border: 2px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
  transition: all 0.2s;
}

.task-view-toggle button:hover {
  border-color: var(--primary-light);
  color: var(--primary-light);
}

.task-view-toggle button.active {
  background: var(--primary-light);
  color: white;
  border-color: var(--primary-light);
  box-shadow: 0 4px 12px rgba(44, 90, 160, 0.2);
}

/* Task remarks style */
.task-remarks {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 8px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 6px;
  font-style: italic;
}

.assigned-by {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 4px 0 0 !important;
}

/* Mobile responsive for modal */
@media (max-width: 600px) {
  .modal-content {
    max-height: 100vh;
    border-radius: 0;
  }
  
  .modal-header {
    border-radius: 0;
  }
  
  .modal-footer {
    border-radius: 0;
  }
  
  .modal-body .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}