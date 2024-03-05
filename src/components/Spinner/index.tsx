import React from 'react';
import './index.scss';

const Spinner = ({ width, height, weight = '3', ...props }) => {
    return (
        <div
            style={{
                height: height + 'px',
                width: width + 'px',
                borderWidth: weight + 'px',
            }}
            className="common-spinner"
            {...props}
        ></div>
    );
};

export default Spinner;
