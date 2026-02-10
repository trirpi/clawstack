import { redirect } from 'next/navigation'
import { getSession, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/Header'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { Notice } from '@/components/ui/Notice'

export const metadata = {
  title: 'Reports - Clawstack',
  description: 'Review and manage content reports',
}

const STATUS_OPTIONS = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED'] as const
type ReportStatus = (typeof STATUS_OPTIONS)[number]

export default async function ReportsPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/login')
  }

  const user = await getCurrentUser()

  if (!user?.publication) {
    redirect('/dashboard')
  }

  const reports = await prisma.report.findMany({
    where: {
      publicationId: user.publication.id,
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <DashboardNav />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-sm text-gray-600">
              Review reports for content in your publication.
            </p>
          </div>
          <Notice tone="info" message={`${reports.length} total report${reports.length === 1 ? '' : 's'}`} />
        </div>

        {reports.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="text-3xl mb-2">✅</div>
            <h2 className="text-lg font-semibold text-gray-900">No reports</h2>
            <p className="text-sm text-gray-600">
              When users report content, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="uppercase tracking-wide">Reported</span>
                      <span>{formatDate(report.createdAt)}</span>
                      <span>•</span>
                      <span className="uppercase tracking-wide">{report.reason}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-gray-900">
                      {report.post.title}
                    </h3>
                    {report.details && (
                      <p className="mt-2 text-sm text-gray-600">{report.details}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <form
                      action={`/api/reports/${report.id}`}
                      method="POST"
                    >
                      <select
                        name="status"
                        defaultValue={report.status as ReportStatus}
                        className="h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-700"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                      <Button type="submit" variant="outline" size="sm" className="ml-2">
                        Update
                      </Button>
                    </form>
                    <a
                      href={`/${user.publication?.slug ?? ''}/${report.post.slug}`}
                      className="text-sm text-orange-600 hover:text-orange-700"
                    >
                      View post
                    </a>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Reporter: {report.reporterEmail || 'Anonymous'} • Status: {report.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
