import type { ReactNode } from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

export type DonutSlice = {
  key: string;
  value: number;
  color: string;
};

const TRACK_COLOR = "#EEF2F0";

export const DonutChart = ({
  data,
  size = 184,
  strokeWidth = 28,
  children,
}: {
  data: DonutSlice[];
  size?: number;
  strokeWidth?: number;
  children?: ReactNode;
}) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  let accumulated = 0;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={TRACK_COLOR}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {total > 0
          ? data.map((slice) => {
              if (slice.value <= 0) return null;
              const fraction = slice.value / total;
              const arc = fraction * circumference;
              const angle = (accumulated / total) * 360 - 90;
              accumulated += slice.value;
              return (
                <Circle
                  key={slice.key}
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={slice.color}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={`${arc} ${circumference}`}
                  strokeLinecap="butt"
                  transform={`rotate(${angle} ${center} ${center})`}
                />
              );
            })
          : null}
      </Svg>
      {children ? <View className="absolute items-center">{children}</View> : null}
    </View>
  );
};
