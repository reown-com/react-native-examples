import Svg, {
  ClipPath,
  Defs,
  G,
  Path,
  Rect,
  type SvgProps,
} from 'react-native-svg';

const SvgConnectionsTab = ({fill, ...props}: SvgProps) => (
  <Svg viewBox="0 0 24 24" fill="none" {...props}>
    <G clip-path="url(#clip0_3144_20835)">
      <Path
        d="M12 21C7.029 21 3 16.971 3 12C3 7.029 7.029 3 12 3C16.971 3 21 7.029 21 12"
        stroke={fill || '#fff'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.51001 9H20.49"
        stroke={fill || '#fff'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.5 15H11.5"
        stroke={fill || '#fff'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 12C16 9.23599 15.277 6.47199 13.833 4.05999C12.986 2.64699 11.014 2.64699 10.168 4.05999C7.27799 8.88499 7.27799 15.116 10.168 19.941C10.591 20.647 11.295 21 12 21"
        stroke={fill || '#fff'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.5 17.9999C18.5 17.9999 18.3591 17.8512 18.3599 17.8512C17.9628 17.4152 16.7538 16.2 15.6327 16.2V16.2015L15.6288 16.2C14.6346 16.1992 13.8289 17.0057 13.8289 17.9999C13.8289 18.9941 14.6346 19.8007 15.628 19.7999L15.6319 19.7983V19.7999C16.753 19.7999 17.9621 18.5838 18.3591 18.1486L18.5 17.9999ZM18.5 17.9999C18.5 17.9999 18.6409 17.8512 18.6402 17.8512C19.0372 17.4152 20.2463 16.2 21.3673 16.2V16.2015L21.3712 16.2C22.3654 16.1992 23.1712 17.0057 23.1712 17.9999C23.1712 18.9941 22.3654 19.8007 21.372 19.7999L21.3681 19.7983V19.7999C20.247 19.7999 19.038 18.5838 18.6409 18.1486L18.5 17.9999Z"
        stroke={fill || '#fff'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_3144_20835">
        <Rect width="24" height="24" fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

export default SvgConnectionsTab;
