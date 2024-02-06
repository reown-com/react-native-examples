import * as React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

function SvgComponent(props: SvgProps) {
  return (
    <Svg viewBox="0 0 512 512" {...props}>
      <Path d="M461.2 128H80c-8.8 0-16-7.2-16-16s7.2-16 16-16h384c8.8 0 16-7.2 16-16 0-26.5-21.5-48-48-48H64C28.7 32 0 60.7 0 96v320c0 35.4 28.7 64 64 64h397.2c28 0 50.8-21.5 50.8-48V176c0-26.5-22.8-48-50.8-48zM416 336c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z" />
    </Svg>
  );
}

export default SvgComponent;
