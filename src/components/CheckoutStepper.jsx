import React from "react";

const steps = [
    { label: "Your Cart", icon: "🛒" },
    { label: "Checkout", icon: "💳" },
    { label: "Finish", icon: "✅" },
];

export default function CheckoutStepper({ current = 0 }) {
    return (
        <div style={styles.wrapper}>
            {steps.map((step, i) => {
                const done = i < current;
                const active = i === current;
                return (
                    <React.Fragment key={i}>
                        <div style={styles.step}>
                            <div
                                style={{
                                    ...styles.circle,
                                    ...(done ? styles.done : active ? styles.active : styles.future),
                                }}
                            >
                                {done ? "✓" : step.icon}
                            </div>
                            <div
                                style={{
                                    ...styles.label,
                                    fontWeight: active ? 700 : 400,
                                    color: done || active ? "#2575fc" : "#aaa",
                                }}
                            >
                                {step.label}
                            </div>
                        </div>
                        {i < steps.length - 1 && (
                            <div
                                style={{
                                    ...styles.line,
                                    background: done ? "#2575fc" : "#ddd",
                                }}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

const styles = {
    wrapper: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        margin: "0 auto 30px",
        maxWidth: 500,
    },
    step: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minWidth: 80,
    },
    circle: {
        width: 44,
        height: 44,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 6,
        transition: "0.3s",
    },
    done: {
        background: "#2575fc",
        color: "white",
    },
    active: {
        background: "white",
        border: "3px solid #2575fc",
        color: "#2575fc",
    },
    future: {
        background: "#f0f0f0",
        color: "#aaa",
        border: "2px solid #ddd",
    },
    label: {
        fontSize: 13,
        textAlign: "center",
    },
    line: {
        flex: 1,
        height: 3,
        borderRadius: 2,
        marginBottom: 24,
        minWidth: 40,
        transition: "0.3s",
    },
};
