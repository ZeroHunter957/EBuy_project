import React from "react";

export default function Footer() {

    return (

        <div className="footer">

            <div className="footerTop">

                <div>
                    <h4>EBuy</h4>
                    <p>Simple ecommerce demo</p>
                </div>

                <div>
                    <h4>Shop</h4>
                    <p>All products</p>
                    <p>Categories</p>
                    <p>Deals</p>
                </div>

                <div>
                    <h4>Account</h4>
                    <p>Login</p>
                    <p>Register</p>
                    <p>Orders</p>
                </div>

                <div>
                    <h4>Info</h4>
                    <p>About</p>
                    <p>Contact</p>
                    <p>Help</p>
                </div>

            </div>

            <div className="footerBottom">
                © 2026 EBuy
            </div>


            <style>{`

.footer {
    margin-top:40px;
    background:#232f3e;
    color:white;
}

.footerTop {
    display:flex;
    justify-content:center;
    gap:80px;
    padding:40px 20px;
    flex-wrap:wrap;
}

.footerTop h4 {
    margin-bottom:10px;
}

.footerTop p {
    margin:4px 0;
    cursor:pointer;
    color:#ddd;
}

.footerTop p:hover {
    color:white;
}

.footerBottom {
    text-align:center;
    padding:15px;
    background:#131a22;
}

`}</style>

        </div>

    );

}