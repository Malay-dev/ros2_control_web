import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GraphStatisticsProps {
  nodesCount: number;
  connectionsCount: number;
}

const GraphStatistics = ({
  nodesCount,
  connectionsCount,
}: GraphStatisticsProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Graph Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-2 bg-gray-100 rounded-md">
            <div className="text-2xl font-bold text-gray-800">{nodesCount}</div>
            <div className="text-xs text-gray-500">Nodes</div>
          </div>
          <div className="text-center p-2 bg-gray-100 rounded-md">
            <div className="text-2xl font-bold text-gray-800">
              {connectionsCount}
            </div>
            <div className="text-xs text-gray-500">Connections</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GraphStatistics;
