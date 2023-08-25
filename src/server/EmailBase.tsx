/* eslint-disable */
import * as React from "react";

interface EmailBaseProps {
    name: string;
    htmlContent: string;
}

const fontStyle = {
    fontFamily: "-apple-system, 'system-ui', 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'"
}

export const EmailBase: React.FC<Readonly<EmailBaseProps>> = ({
    name,
    htmlContent
}) => (
    <table width="100%" style={{
        padding: "3em",
        background: "rgb(211, 211, 211)",
        border: 0,
    }} cellSpacing="0" cellPadding="0">
        <tr>
            <td>
                <table align="center" style={{
                    maxWidth: "700px",
                    padding: "3em",
                    background: "white",
                }}>
                    <img src="https://i.ibb.co/MNsz2fG/logo.png" width="80px" alt="" />
                    <br />
                    <p style={{
                        ...fontStyle,
                        marginBottom: "2em",
                    }}>Dear {name},</p>
                    <p style={{
                        ...fontStyle,
                        marginBottom: "2em",
                    }} dangerouslySetInnerHTML={{ __html: htmlContent }}></p>
                    <p style={{
                        ...fontStyle,
                        lineHeight: "1.5em"
                    }}>Regards,<br />Savage Tumaz</p>
                    <hr />
                    <p style={fontStyle}>This automated email was sent to you because you are a registered user of Savage Manage.</p>
                </table>
            </td>
        </tr>
    </table>
);
