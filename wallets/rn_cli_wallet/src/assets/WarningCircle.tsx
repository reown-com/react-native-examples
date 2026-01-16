import Svg, { Path, type SvgProps } from 'react-native-svg';

const SvgWarningCircle = (props: SvgProps) => (
  <Svg viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
      fill={props.fill || '#DF4A34'}
    />
  </Svg>
);

export default SvgWarningCircle;
