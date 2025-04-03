import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const GraphLegend = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Legend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-xs text-gray-700">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-purple-500"></div>
            <span>Controller</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-amber-500"></div>
            <span>Hardware/Actuator</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span>Joint</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-gray-500"></div>
            <span>Other</span>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2"></div>

          <div className="flex items-center space-x-2">
            <div className="h-2 w-8 bg-red-500"></div>
            <span>Command Interface</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-8 bg-green-500"></div>
            <span>State Interface</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-8 bg-gray-500"></div>
            <span>Other Connection</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default GraphLegend

