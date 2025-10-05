import * as React from 'react';
import * as RechartsPrimitive from 'recharts';
import type { LegendPayload, LegendProps, TooltipContentProps } from 'recharts';

import { cn } from '@/lib/utils';

type DefaultValueType = number | string;
type DefaultNameType = string;

type DefaultTooltipProps = TooltipContentProps<
  DefaultValueType,
  DefaultNameType
>;
type TooltipPayloadItem = NonNullable<DefaultTooltipProps['payload']>[number];

type LegendPayloadItem = LegendPayload;
type LegendPayloadArray = LegendPayloadItem[];

const THEMES = { light: '', dark: '.dark' } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }

  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config: ChartConfig;
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >['children'];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = 'Chart';

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, itemConfig]) => itemConfig.theme || itemConfig.color
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .filter(Boolean)
  .join('\n')}
}
`
          )
          .join('\n'),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

type ChartTooltipContentProps = Omit<DefaultTooltipProps, 'content'> &
  React.ComponentProps<'div'> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: 'line' | 'dot' | 'dashed';
    nameKey?: string;
    labelKey?: string;
    color?: string;
  };

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(
  (
    {
      active,
      payload,
      className,
      indicator = 'dot',
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
      ...divProps
    },
    ref
  ) => {
    const { config } = useChart();
    const resolvedPayload = (payload ?? []) as TooltipPayloadItem[];

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || resolvedPayload.length === 0) {
        return null;
      }

      const [item] = resolvedPayload;
      const key = `${labelKey || item.dataKey || item.name || 'value'}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value =
        !labelKey && typeof label === 'string'
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label;

      if (labelFormatter) {
        return (
          <div className={cn('font-medium', labelClassName)}>
            {labelFormatter(value, resolvedPayload)}
          </div>
        );
      }

      if (!value) {
        return null;
      }

      return <div className={cn('font-medium', labelClassName)}>{value}</div>;
    }, [
      label,
      labelFormatter,
      resolvedPayload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ]);

    if (!active || resolvedPayload.length === 0) {
      return null;
    }

    const nestLabel = resolvedPayload.length === 1 && indicator !== 'dot';

    return (
      <div
        ref={ref}
        className={cn(
          'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
          className
        )}
        {...divProps}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {resolvedPayload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || 'value'}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor =
              color ??
              (typeof item.payload === 'object' && item.payload
                ? (item.payload as { fill?: string }).fill
                : undefined) ??
              item.color;

            const hasFormatter =
              formatter && item.value !== undefined && item.name !== undefined;
            const displayValue =
              typeof item.value === 'number'
                ? item.value.toLocaleString()
                : item.value !== undefined && item.value !== null
                ? String(item.value)
                : undefined;

            return (
              <div
                key={String(item.dataKey ?? item.name ?? index)}
                className={cn(
                  'flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground',
                  indicator === 'dot' && 'items-center'
                )}
              >
                {hasFormatter ? (
                  formatter!(item.value!, item.name!, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            'shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]',
                            {
                              'h-2.5 w-2.5': indicator === 'dot',
                              'w-1': indicator === 'line',
                              'w-0 border-[1.5px] border-dashed bg-transparent':
                                indicator === 'dashed',
                              'my-0.5': nestLabel && indicator === 'dashed',
                            }
                          )}
                          style={
                            {
                              '--color-bg': indicatorColor,
                              '--color-border': indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        'flex flex-1 justify-between leading-none',
                        nestLabel ? 'items-end' : 'items-center'
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {displayValue !== undefined && (
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {displayValue}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = 'ChartTooltip';

const ChartLegend = RechartsPrimitive.Legend;

type ChartLegendContentProps = React.ComponentProps<'div'> & {
  hideIcon?: boolean;
  nameKey?: string;
  payload?: LegendPayloadArray;
  verticalAlign?: LegendProps['verticalAlign'];
};

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  ChartLegendContentProps
>(
  (
    { className, hideIcon = false, payload, verticalAlign = 'bottom', nameKey },
    ref
  ) => {
    const { config } = useChart();
    const legendPayload = (payload ?? []) as LegendPayloadItem[];

    if (legendPayload.length === 0) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center gap-4',
          verticalAlign === 'top' ? 'pb-3' : 'pt-3',
          className
        )}
      >
        {legendPayload.map((item, index) => {
          const key = `${nameKey || item.dataKey || 'value'}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const backgroundColor =
            item.color ??
            (typeof item.payload === 'object' && item.payload
              ? (item.payload as { fill?: string }).fill
              : undefined) ??
            'var(--foreground)';

          return (
            <div
              key={String(item.dataKey ?? item.value ?? index)}
              className={cn(
                'flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground'
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          );
        })}
      </div>
    );
  }
);
ChartLegendContent.displayName = 'ChartLegend';

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== 'object' || payload === null) {
    return undefined;
  }

  const payloadPayload =
    'payload' in payload &&
    typeof (payload as { payload?: unknown }).payload === 'object' &&
    (payload as { payload?: unknown }).payload !== null
      ? (payload as { payload?: Record<string, unknown> }).payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof (payload as Record<string, unknown>)[key] === 'string'
  ) {
    configLabelKey = (payload as Record<string, string>)[key];
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key] === 'string'
  ) {
    configLabelKey = payloadPayload[key] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
