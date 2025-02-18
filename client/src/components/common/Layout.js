import styled from 'styled-components';

export const Container = styled.div`
  max-width: ${props => props.maxWidth || '1200px'};
  margin: 0 auto;
  padding: 0 20px;
  width: 100%;
`;

export const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: ${props => props.padding || '40px 0'};
`;

export const Flex = styled.div`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  justify-content: ${props => props.justify || 'flex-start'};
  align-items: ${props => props.align || 'stretch'};
  gap: ${props => props.gap || '0'};
  flex-wrap: ${props => props.wrap || 'nowrap'};
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || 'repeat(12, 1fr)'};
  gap: ${props => props.gap || '20px'};
  padding: ${props => props.padding || '0'};
  margin: ${props => props.margin || '0'};

  @media (max-width: 768px) {
    grid-template-columns: ${props => props.mobileColumns || '1fr'};
  }
`; 