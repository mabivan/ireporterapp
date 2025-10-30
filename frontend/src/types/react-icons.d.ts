declare module 'react-icons/fi' {
  import { FC, SVGProps } from 'react';
  
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
  }

  export const FiHome: FC<IconProps>;
  export const FiFileText: FC<IconProps>;
  export const FiPlusSquare: FC<IconProps>;
  export const FiUser: FC<IconProps>;
  export const FiUsers: FC<IconProps>;
  export const FiBarChart2: FC<IconProps>;
  export const FiLogOut: FC<IconProps>;
  export const FiChevronLeft: FC<IconProps>;
  export const FiChevronRight: FC<IconProps>;
  export const FiMenu: FC<IconProps>;
  export const FiSearch: FC<IconProps>;
  export const FiShield: FC<IconProps>;
  export const FiSettings: FC<IconProps>;
}