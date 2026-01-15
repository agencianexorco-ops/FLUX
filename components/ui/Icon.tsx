
import React from 'react';
import {
  HomeIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  ChartPieIcon,
  ArrowsRightLeftIcon,
  TagIcon,
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

interface IconProps {
  name: string;
  className?: string;
}

const iconMap: { [key: string]: React.ElementType } = {
  home: HomeIcon,
  cog: Cog6ToothIcon,
  'credit-card': CreditCardIcon,
  'chart-pie': ChartPieIcon,
  'switch-horizontal': ArrowsRightLeftIcon,
  tag: TagIcon,
  bell: BellIcon,
  'chevron-left': ChevronLeftIcon,
  'chevron-right': ChevronRightIcon,
  plus: PlusIcon,
  trash: TrashIcon,
  pencil: PencilIcon,
  'arrow-up': ArrowUpIcon,
  'arrow-down': ArrowDownIcon,
  x: XMarkIcon,
  check: CheckIcon,
};

const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6' }) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    return <HomeIcon className={className} />; // Fallback icon
  }

  return <IconComponent className={className} />;
};

export default Icon;
