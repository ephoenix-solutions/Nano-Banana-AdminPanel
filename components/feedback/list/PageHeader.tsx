interface PageHeaderProps {
  // No add button for feedback - it's user-generated only
}

export default function PageHeader({}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold text-primary font-heading">
          Feedback
        </h1>
        <p className="text-secondary mt-2 font-body">
          User feedback and ratings
        </p>
      </div>
    </div>
  );
}
