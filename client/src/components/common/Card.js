import styled from 'styled-components';

const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: ${props => props.padding || '24px'};
  margin: ${props => props.margin || '0'};
  width: ${props => props.width || 'auto'};
  max-width: ${props => props.maxWidth || 'none'};
`;

export const CardHeader = styled.div`
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;

  h2 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.5rem;
  }
`;

export const CardBody = styled.div`
  padding: ${props => props.padding || '0'};
`;

export const CardFooter = styled.div`
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: ${props => props.justify || 'flex-end'};
  gap: 12px;
`;

export default Card; 