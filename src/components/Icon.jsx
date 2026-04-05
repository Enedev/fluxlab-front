import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const DEFAULT_ICON_COLOR = '#059669';

export default function Icon({
  icon,
  size = '1x',
  color = DEFAULT_ICON_COLOR,
  className = '',
  style,
  ...rest
}) {
  const mergedStyle = {
    ...(typeof size === 'number' ? { fontSize: `${size}px` } : null),
    ...(color ? { color } : null),
    ...(style || {})
  };

  return (
    <FontAwesomeIcon
      icon={icon}
      size={typeof size === 'string' ? size : undefined}
      className={className}
      style={mergedStyle}
      {...rest}
    />
  );
}
