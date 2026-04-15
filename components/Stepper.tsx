type StepperProps = {
  steps: string[];
  current: number;
};

export default function Stepper({ steps, current }: StepperProps) {
  return (
    <div className="stepper" aria-label="Form progress">
      {steps.map((step, index) => (
        <div
          key={step}
          className={`stepper-dot ${index <= current ? 'active' : ''}`}
          title={step}
        />
      ))}
    </div>
  );
}
