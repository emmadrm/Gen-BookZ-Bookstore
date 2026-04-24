import React from 'react';
import '../index.css';

function Footer(){
    const Year = new Date();
    return(
        <div className="container"> 
        <footer className="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top"> 
            <div className="col-md-4 d-flex align-items-center">
                <span className="mb-3 mb-md-0 text-body-secondary">© {Year.getFullYear()} Gen BookZ, Inc</span> 
            </div> 

        </footer> 
        </div>
    )
}

export default Footer;