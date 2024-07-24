import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const Board = styled.div`
    display: flex;
    flex-direction: column;
    margin: 10px;
    overflow: hidden;
`;

export const Column = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 10px;
`;

export const ColumnBox = styled.div`
    display: flex;
    width: 100%;
`;

export const ColumnTitle = styled.h3`
    margin-top: 0;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 3px solid #007bff;
    font-size: 16px;
    font-weight: 300;
`;

export const IssueList = styled.ul`
    flex-grow: 1;
    width: 100%;
    margin: 0;
    padding: 0;
    background-color: #f0f0f0;
`;

export const FilterContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 10px;
`;

export const FilterInput = styled.input`
    flex-grow: 1;
    padding: 8px;
    margin-right: 10px;
    font-size: 14px;
`;

export const FilterButton = styled.button`
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 14px;
`;

interface IssueItemProps {
    type?: 'Low' | 'Medium' | 'High';
}

export const IssueItem = styled.li<IssueItemProps>`
    display: block;
    position: relative;
    min-height: 90px;
    padding: 1em;
    padding-left: calc(1em + 19px);
    border: 1px solid #b0b0b0;
    background-color: white;
    font-size: 14px;

    &:before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        width: 5px;
        background-color: ${props => {
            switch (props.type) {
                case 'Low':
                    return '#ffc107';
                case 'Medium':
                    return '#ff9800';
                case 'High':
                    return '#dc3545';
                default:
                    return '#dc3545';
            }
        }};
    }

    &:hover {
        a {
            color: #0000ff;
            border-bottom-color: #0000ff;
        }
    }

    & + & {
        border-top: 0;
    }

    
`;

export const StyledLink = styled(Link)`
  text-decoration: none;
`;

export const DueTime = styled.div`
    position: absolute;
    right: 1em;
    bottom: 1em;
    min-height: calc(1em * 1.618);
    min-width: 2em;
    padding: 0 0.5em;
    background-color: #d0d0d0;
    border-radius: 999em;
    font-size: 11px;
    text-align: center;
`;

export const Creator = styled.div`
    position: absolute;
    left: 1em;
    bottom: 1em;
    min-height: calc(1em * 1.618);
    min-width: 2em;
    padding: 0 0.5em;
    background-color: #d0d0d0;
    border-radius: 999em;
    font-size: 11px;
    text-align: center;
`;

export const ActionButtons = styled.div`
    position: absolute;
    right: 1em;
    top: 1em;
    padding: 0 0.5em;
    border-radius: 999em;
`;

export const TaskName = styled(Link)`
    border-bottom: 1px solid transparent;
    color: black;
    text-transform: uppercase;
    text-decoration: none;
    transition: all 150ms ease-in;
`;

export const Description = styled.p`
    margin-top: 0;
    margin-right: calc(1em + 32px + 5px);
    margin-bottom: 0;
`;

export const Button = styled.img`
    margin-left: 0.3rem;
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
        transform: scale(1.1);
    }
`;
