import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow-soft hover:brightness-105',
        ghost:
          'border border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:text-indigo-600',
        success: 'bg-emerald-500 text-white hover:bg-emerald-600',
      },
      size: {
        sm: 'px-3 py-2 text-xs',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
  {
    variants: {
      tone: {
        neutral: 'border-slate-200 bg-slate-100 text-slate-700',
        info: 'border-indigo-200 bg-indigo-50 text-indigo-700',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        warning: 'border-amber-200 bg-amber-50 text-amber-700',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
);

export const cardVariants = cva(
  'rounded-[28px] border border-slate-200 bg-white shadow-soft',
  {
    variants: {
      padding: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      padding: 'md',
    },
  },
);
