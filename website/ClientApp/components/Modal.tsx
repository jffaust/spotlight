import * as React from 'react';

type ModalProps = {
    active: boolean
    title: string
    description: string
    onClose: () => void;
};

export default function Modal(props: React.PropsWithChildren<ModalProps>) {
  if (!props.active) {
      return null;
    } else {
      return (
        <div className="modal">
          <div className="modal-content">
            <span
              className="modal-close"
              onClick={() => props.onClose()}
            >
              &times;
            </span>
            <h3>{props.title}</h3>
            <p>{props.description}</p>
            {props.children}
          </div>
        </div>
      );
    }
}