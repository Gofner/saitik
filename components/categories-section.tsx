import Link from 'next/link'
import type { Category } from '@/lib/types'
import { CategoryIcon } from '@/components/category-icon'

export function CategoriesSection({ categories }: { categories: Category[] }) {
  if (!categories.length) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <h2 className="mb-6 text-xl font-semibold text-foreground">Категории</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/catalog?category=${cat.slug}`}
            className="group flex flex-col items-center gap-3 rounded-lg border border-border/50 bg-card p-5 transition-all duration-200 hover:border-border hover:bg-secondary/50"
          >
            <CategoryIcon
              icon={cat.icon}
              className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-foreground"
            />
            <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
