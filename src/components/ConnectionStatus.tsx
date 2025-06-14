
import React from "react";

interface ConnectionStatusProps {
  status?: string;
  attempts: number;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status, attempts }) => (
  <div className="text-center">
    <div className="text-sm text-gray-500">
      Status: {status || "disconnected"}
      {attempts > 0 && ` (Attempt ${attempts})`}
    </div>
  </div>
);

export default ConnectionStatus;
