import { useEffect } from 'react';
import { IDELayout } from '@/components/layout/IDELayout';
import { useProjectStore } from '@/stores/projectStore';

export default function IDE() {
  const { currentProject, createProject } = useProjectStore();

  useEffect(() => {
    // Create a default project if none exists
    if (!currentProject) {
      createProject('New Comic Project', '16:9');
    }
  }, [currentProject, createProject]);

  useEffect(() => {
    // Add IDE mode class to root element
    const root = document.getElementById('root');
    if (root) {
      root.classList.add('ide-mode');
    }

    // Cleanup on unmount
    return () => {
      if (root) {
        root.classList.remove('ide-mode');
      }
    };
  }, []);

  if (!currentProject) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Loading Project...</h2>
          <p className="text-muted-foreground">Setting up your workspace</p>
        </div>
      </div>
    );
  }

  return (
    <div className=""> {/* Account for fixed navigation */}
      <IDELayout project={currentProject} />
    </div>
  );
}