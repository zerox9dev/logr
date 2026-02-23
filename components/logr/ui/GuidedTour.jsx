import { useEffect, useMemo, useState } from "react";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function GuidedTour({ theme, steps, stepIndex, onBack, onNext, onClose, onFinish }) {
  const step = steps[stepIndex];
  const lastStep = stepIndex === steps.length - 1;
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    const updateTarget = () => {
      if (!step?.selector) {
        setTargetRect(null);
        return;
      }

      const element = document.querySelector(step.selector);
      if (!element) {
        setTargetRect(null);
        return;
      }

      const rect = element.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom,
      });
    };

    updateTarget();

    const element = step?.selector ? document.querySelector(step.selector) : null;
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }

    window.addEventListener("resize", updateTarget);
    window.addEventListener("scroll", updateTarget, true);
    const interval = window.setInterval(updateTarget, 250);

    return () => {
      window.removeEventListener("resize", updateTarget);
      window.removeEventListener("scroll", updateTarget, true);
      window.clearInterval(interval);
    };
  }, [step?.selector]);

  const tooltipPosition = useMemo(() => {
    const viewportWidth = typeof window === "undefined" ? 1280 : window.innerWidth;
    const viewportHeight = typeof window === "undefined" ? 720 : window.innerHeight;
    const width = 340;
    const height = 230;
    const padding = 14;

    if (!targetRect) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width,
      };
    }

    const maxLeft = Math.max(padding, viewportWidth - width - padding);
    const left = clamp(targetRect.left, padding, maxLeft);

    let top = targetRect.bottom + 12;
    if (top + height > viewportHeight - padding) {
      top = Math.max(padding, targetRect.top - height - 12);
    }

    return { top, left, width };
  }, [targetRect]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 170, pointerEvents: "none" }}>
      {targetRect ? (
        <div
          style={{
            position: "fixed",
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            borderRadius: 8,
            border: `2px solid ${theme.timerColor}`,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
            pointerEvents: "none",
            transition: "all 0.18s ease",
          }}
        />
      ) : (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", pointerEvents: "none" }} />
      )}

      <div
        style={{
          position: "fixed",
          ...tooltipPosition,
          background: theme.bg,
          color: theme.text,
          border: `1px solid ${theme.border}`,
          boxShadow: "0 12px 36px rgba(0,0,0,0.25)",
          padding: 16,
          pointerEvents: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.16em" }}>
            TOUR {stepIndex + 1}/{steps.length}
          </div>
          <button
            onClick={onClose}
            style={{ border: `1px solid ${theme.border}`, background: "transparent", color: theme.muted, cursor: "pointer", padding: "4px 8px", fontSize: 10, letterSpacing: "0.1em" }}
          >
            CLOSE
          </button>
        </div>

        <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 28, lineHeight: 1.05, letterSpacing: "-0.02em", color: theme.timerColor, marginBottom: 10 }}>
          {step.title}
        </div>
        <div style={{ fontSize: 12, color: theme.muted, lineHeight: 1.6, marginBottom: 12 }}>{step.description}</div>
        {!targetRect ? (
          <div style={{ fontSize: 11, color: theme.faint, marginBottom: 12 }}>
            This element is not visible right now. Complete the previous step or switch to Tracker.
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onBack}
            disabled={stepIndex === 0}
            style={{
              flex: 1,
              border: `1px solid ${theme.border}`,
              background: "transparent",
              color: theme.muted,
              cursor: stepIndex === 0 ? "not-allowed" : "pointer",
              opacity: stepIndex === 0 ? 0.5 : 1,
              padding: "9px 10px",
              letterSpacing: "0.1em",
              fontSize: 10,
            }}
          >
            BACK
          </button>
          {!lastStep ? (
            <button
              onClick={onNext}
              style={{
                flex: 1,
                border: `1px solid ${theme.border}`,
                background: theme.timerColor,
                color: "#fff",
                cursor: "pointer",
                padding: "9px 10px",
                letterSpacing: "0.1em",
                fontSize: 10,
              }}
            >
              NEXT
            </button>
          ) : (
            <button
              onClick={onFinish}
              style={{
                flex: 1,
                border: `1px solid ${theme.border}`,
                background: theme.timerColor,
                color: "#fff",
                cursor: "pointer",
                padding: "9px 10px",
                letterSpacing: "0.1em",
                fontSize: 10,
              }}
            >
              FINISH
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
