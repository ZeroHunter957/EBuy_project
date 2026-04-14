import React from "react";

const STEPS = [
    { key: "PENDING", label: "Pending confirmation", icon: "🕐" },
    { key: "CONFIRMED", label: "Order confirmed", icon: "✔️" },
    { key: "SHIPPED", label: "Order shipped", icon: "🚚" },
    { key: "DELIVERED", label: "Order delivered", icon: "📦" },
];

const CANCELLED_STEP = { key: "CANCELLED", label: "Order cancelled", icon: "❌" };

export default function OrderTimeline({ status }) {
    const s = (status ?? "PENDING").toUpperCase();

    if (s === "CANCELLED") {
        return (
            <div style={styles.wrapper}>
                <div style={{ ...styles.dot, ...styles.cancelled }}>{CANCELLED_STEP.icon}</div>
                <div style={{ ...styles.label, color: "#dc3545", fontWeight: 700 }}>
                    {CANCELLED_STEP.label}
                </div>
            </div>
        );
    }

    const currentIdx = STEPS.findIndex((st) => st.key === s);

    return (
        <div style={styles.wrapper}>
            {STEPS.map((step, i) => {
                const done = i <= currentIdx;
                const active = i === currentIdx;
                return (
                    <React.Fragment key={step.key}>
                        <div style={styles.stepCol}>
                            <div
                                style={{
                                    ...styles.dot,
                                    background: done ? "#2575fc" : "#e9ecef",
                                    color: done ? "#fff" : "#aaa",
                                    border: active ? "3px solid #1a5bbf" : "none",
                                    transform: active ? "scale(1.2)" : "scale(1)",
                                }}
                            >
                                {step.icon}
                            </div>
                            <div
                                style={{
                                    ...styles.label,
                                    fontWeight: active ? 700 : 400,
                                    color: done ? "#2575fc" : "#bbb",
                                }}
                            >
                                {step.label}
                            </div>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div
                                style={{
                                    ...styles.line,
                                    background: i < currentIdx ? "#2575fc" : "#e9ecef",
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
        padding: "12px 0",
    },
    stepCol: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minWidth: 72,
    },
    dot: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        marginBottom: 6,
        transition: "0.3s",
    },
    cancelled: {
        background: "#dc3545",
        color: "#fff",
    },
    label: {
        fontSize: 12,
        textAlign: "center",
        whiteSpace: "nowrap",
    },
    line: {
        flex: 1,
        height: 3,
        borderRadius: 2,
        marginBottom: 22,
        minWidth: 30,
        transition: "0.3s",
    },
};
