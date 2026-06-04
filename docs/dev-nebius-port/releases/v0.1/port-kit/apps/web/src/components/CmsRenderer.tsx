// Wraps Page Constructor so we can load it through next/dynamic in the
// catch-all route. PageConstructor pulls Swiper transitively, which uses
// an older ESM resolution scheme Node refuses to load during the
// `Collecting page data` step of `next build`. Routing the component
// through next/dynamic moves the import to webpack/runtime resolution and
// sidesteps the issue while still SSRing the markup.
//
// We pass the active theme to PageConstructorProvider so its internal
// `g-root_theme_*` wrapper flips with our toggle. Without this, the
// PageConstructor wrapper hardcodes light and beats the html-level dark
// class via CSS specificity.

import {
  PageConstructor,
  PageConstructorProvider,
  Theme as PCTheme,
  type PageContent,
} from '@gravity-ui/page-constructor';

import {useThemeToggle} from '@/components/chrome/ThemeToggle';
import {customBlocks} from '@/lib/pageConstructor';

export interface CmsRendererProps {
  content: PageContent;
}

export default function CmsRenderer({content}: CmsRendererProps) {
  const {theme} = useThemeToggle();
  // PCTheme is a string enum ('light' | 'dark') under the hood — same values
  // as ours, just nominally distinct in TypeScript.
  const pcTheme = theme === 'dark' ? PCTheme.Dark : PCTheme.Light;
  return (
    <PageConstructorProvider theme={pcTheme}>
      <PageConstructor content={content} custom={{blocks: customBlocks}} />
    </PageConstructorProvider>
  );
}
