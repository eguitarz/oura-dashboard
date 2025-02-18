import styled, { css } from 'styled-components';

const baseButtonStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  gap: 8px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const variants = {
  primary: css`
    background-color: #007bff;
    color: white;
    &:hover:not(:disabled) {
      background-color: #0056b3;
    }
  `,
  secondary: css`
    background-color: #6c757d;
    color: white;
    &:hover:not(:disabled) {
      background-color: #5a6268;
    }
  `,
  danger: css`
    background-color: #dc3545;
    color: white;
    &:hover:not(:disabled) {
      background-color: #c82333;
    }
  `,
  outline: css`
    background-color: transparent;
    border: 2px solid #007bff;
    color: #007bff;
    &:hover:not(:disabled) {
      background-color: #007bff;
      color: white;
    }
  `
};

const Button = styled.button`
  ${baseButtonStyles}
  ${props => variants[props.variant || 'primary']}
  ${props => props.fullWidth && css`
    width: 100%;
  `}
`;

export default Button; 