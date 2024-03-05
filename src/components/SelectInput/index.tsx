import React, { useEffect, useRef, useState } from 'react';
import './index.scss';
import { ChevronDown } from 'react-feather';
import { Popover } from 'react-tiny-popover';

const SelectInput = ({
    value = null,
    onChange,
    placeholder = '',
    className = '',
    error,
    options = [],
    icon: Icon,
    onOpen,
    variant = 'default',
    emptyOptionsText = 'No options to show',
    dropdownAlign = 'start',
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value);
    const inputRef = useRef();

    useEffect(() => {
        if (value) setSelectedValue(value);
    }, [value]);

    useEffect(() => {
        const handler = (e) => {
            if (inputRef.current && !inputRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };

        window.addEventListener('click', handler);
        return () => {
            window.removeEventListener('click', handler);
        };
    });

    const getDisplay = () => {
        if (!selectedValue || selectedValue.length === 0) {
            return placeholder;
        }

        return selectedValue.label;
    };

    const isSelected = (option) => {
        if (!selectedValue) {
            return false;
        }

        return selectedValue.value === option.value;
    };

    const onItemClick = (option) => {
        setSelectedValue(option);
        onChange(option);
        handleInputClick();
    };

    const handleInputClick = () => {
        if (onOpen && !showMenu) onOpen();
        setShowMenu(!showMenu);
    };

    return (
        <Popover
            isOpen={showMenu}
            align={dropdownAlign}
            positions={['bottom', 'top', 'left', 'right']} // preferred positions by priority
            content={
                <div className="dg-dropdown-menu">
                    {options.length === 0 && (
                        <div className="dg-dropdown-menu__empty">
                            {emptyOptionsText}
                        </div>
                    )}
                    {options.map((option) => (
                        <div
                            onClick={(e) => {
                                onItemClick(option);
                                e.stopPropagation();
                            }}
                            key={option.value}
                            className={`dg-dropdown-item ${
                                isSelected(option) && 'selected'
                            } dg-dropdown-item__${option.variant || ''}`}
                        >
                            <span>{option.label}</span>
                        </div>
                    ))}
                </div>
            }
        >
            <div
                className={`dg-dropdown-container ${className} ${
                    error ? 'dg-dropdown-container-error' : ''
                } ${variant === 'pill' ? 'dg-dropdown-container-pill' : ''} `}
            >
                {Icon && (
                    <div className="dg-dropdown-icon">
                        <Icon />
                    </div>
                )}
                <div
                    ref={inputRef}
                    onClick={handleInputClick}
                    className={`dg-dropdown-input ${
                        Icon ? 'dg-dropdown-input-icon' : ''
                    }`}
                >
                    <span
                        className={` ${
                            !selectedValue ? 'dg-dropdown-placeholder' : ''
                        }`}
                    >
                        {getDisplay()}
                    </span>
                    <ChevronDown />
                </div>
            </div>
        </Popover>
    );
};


export default SelectInput;
