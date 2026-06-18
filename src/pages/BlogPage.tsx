import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { BlogPost, CreateBlogPostRequest } from '../types/blog';
import type { BlogPostFilters } from '../api/blogApi';
import { getAllBlogPosts, createBlogPost, updateBlogPost, publishBlogPost, unpublishBlogPost } from '../api/blogApi';

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response?: { data?: unknown } }).response?.data;
    if (data && typeof data === 'object') {
      if ('message' in data && typeof (data as { message: unknown }).message === 'string') {
        return (data as { message: string }).message;
      }
      if ('errors' in data) {
        const msgs = Object.values(
          (data as { errors: Record<string, string[]> }).errors
        ).flat();
        if (msgs.length > 0) return msgs.join(' ');
      }
    }
  }
  return 'An unexpected error occurred.';
}

const EMPTY_FORM = {
  title: '',
  slug: '',
  language: 'en',
  category: '',
  isPublished: false,
  publishedAt: '',
  summary: '',
  content: '',
  coverImageUrl: '',
  seoTitle: '',
  metaDescription: '',
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [languageFilter, setLanguageFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchPosts = () => {
    setLoading(true);
    setError('');
    const filters: BlogPostFilters = {};
    if (languageFilter.trim()) filters.language = languageFilter.trim().toLowerCase();
    if (categoryFilter.trim()) filters.category = categoryFilter.trim();
    if (publishedFilter !== '') filters.isPublished = publishedFilter === 'true';

    getAllBlogPosts(filters)
      .then(({ data }) => setPosts(data))
      .catch(() => setError('Failed to load blog posts. Check that the backend is running.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, [languageFilter, categoryFilter, publishedFilter]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setSlugManuallyEdited(false);
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (post: BlogPost) => {
    setForm({
      title: post.title,
      slug: post.slug,
      language: post.language,
      category: post.category ?? '',
      isPublished: post.isPublished,
      publishedAt: post.publishedAt ? post.publishedAt.substring(0, 16) : '',
      summary: post.summary ?? '',
      content: post.content,
      coverImageUrl: post.coverImageUrl ?? '',
      seoTitle: post.seoTitle ?? '',
      metaDescription: post.metaDescription ?? '',
    });
    setSlugManuallyEdited(true);
    setEditingId(post.id);
    setFormError('');
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormError('');
    setSlugManuallyEdited(false);
  };

  const handleTitleChange = (value: string) => {
    setForm(f => ({
      ...f,
      title: value,
      slug: slugManuallyEdited ? f.slug : toSlug(value),
    }));
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setForm(f => ({ ...f, slug: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    const payload: CreateBlogPostRequest = {
      title: form.title,
      slug: form.slug,
      summary: form.summary.trim() || null,
      content: form.content,
      coverImageUrl: form.coverImageUrl.trim() || null,
      seoTitle: form.seoTitle.trim() || null,
      metaDescription: form.metaDescription.trim() || null,
      category: form.category.trim() || null,
      language: form.language.trim().toLowerCase() || 'en',
      isPublished: form.isPublished,
      publishedAt: form.publishedAt || null,
    };

    try {
      if (editingId === null) {
        const { data } = await createBlogPost(payload);
        setPosts(prev => [data, ...prev]);
      } else {
        const { data } = await updateBlogPost(editingId, payload);
        setPosts(prev => prev.map(p => p.id === data.id ? data : p));
      }
      cancelForm();
    } catch (err) {
      setFormError(extractError(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const { data } = post.isPublished
        ? await unpublishBlogPost(post.id)
        : await publishBlogPost(post.id);
      setPosts(prev => prev.map(p => p.id === data.id ? data : p));
    } catch {
      // table stays unchanged on failure
    }
  };

  const hasFilters = !!(languageFilter || categoryFilter || publishedFilter);

  const clearFilters = () => {
    setLanguageFilter('');
    setCategoryFilter('');
    setPublishedFilter('');
  };

  return (
    <div>
      <div className="page-header">
        <h2>Blog Posts</h2>
        {!showForm && (
          <button className="btn-indigo" onClick={openCreate}>Add Post</button>
        )}
      </div>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="filter-language">Language</label>
          <input
            id="filter-language"
            type="text"
            value={languageFilter}
            onChange={e => setLanguageFilter(e.target.value)}
            placeholder="e.g. en, tr"
          />
        </div>
        <div className="filter-group">
          <label htmlFor="filter-published">Status</label>
          <select
            id="filter-published"
            value={publishedFilter}
            onChange={e => setPublishedFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filter-category">Category</label>
          <input
            id="filter-category"
            type="text"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            placeholder="category"
          />
        </div>
        {hasFilters && (
          <button className="btn-clear" onClick={clearFilters}>Clear filters</button>
        )}
      </div>

      {showForm && (
        <div className="form-panel">
          <h3>{editingId === null ? 'Add Post' : 'Edit Post'}</h3>
          {formError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{formError}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="blog-title">Title *</label>
                <input
                  id="blog-title"
                  type="text"
                  value={form.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  required
                  maxLength={200}
                />
              </div>
              <div className="form-group">
                <label htmlFor="blog-slug">Slug *</label>
                <input
                  id="blog-slug"
                  type="text"
                  value={form.slug}
                  onChange={e => handleSlugChange(e.target.value)}
                  required
                  maxLength={200}
                  placeholder="e.g. my-first-post"
                />
              </div>
              <div className="form-group">
                <label htmlFor="blog-language">Language *</label>
                <input
                  id="blog-language"
                  type="text"
                  value={form.language}
                  onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                  required
                  maxLength={10}
                  placeholder="en"
                />
              </div>
              <div className="form-group">
                <label htmlFor="blog-category">Category</label>
                <input
                  id="blog-category"
                  type="text"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label htmlFor="blog-cover">Cover Image URL</label>
                <input
                  id="blog-cover"
                  type="text"
                  value={form.coverImageUrl}
                  onChange={e => setForm(f => ({ ...f, coverImageUrl: e.target.value }))}
                  maxLength={500}
                  placeholder="https://..."
                />
              </div>
              <div className="form-group">
                <label htmlFor="blog-seo-title">SEO Title</label>
                <input
                  id="blog-seo-title"
                  type="text"
                  value={form.seoTitle}
                  onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))}
                  maxLength={200}
                />
              </div>
              <div className="form-check">
                <input
                  id="blog-published"
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
                />
                <label htmlFor="blog-published">Published</label>
              </div>
              <div className="form-group">
                <label htmlFor="blog-published-at">Published At</label>
                <input
                  id="blog-published-at"
                  type="datetime-local"
                  value={form.publishedAt}
                  onChange={e => setForm(f => ({ ...f, publishedAt: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="form-group">
                <label htmlFor="blog-summary">Summary</label>
                <textarea
                  id="blog-summary"
                  value={form.summary}
                  onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                  maxLength={500}
                  rows={2}
                  placeholder="Short description shown in post listings"
                />
              </div>
              <div className="form-group">
                <label htmlFor="blog-content">Content *</label>
                <textarea
                  id="blog-content"
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  required
                  rows={8}
                  placeholder="Post body (plain text or Markdown)"
                />
              </div>
              <div className="form-group">
                <label htmlFor="blog-meta">Meta Description</label>
                <textarea
                  id="blog-meta"
                  value={form.metaDescription}
                  onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))}
                  maxLength={300}
                  rows={2}
                  placeholder="SEO meta description (max 300 chars)"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-indigo" disabled={formLoading}>
                {formLoading ? 'Saving…' : (editingId === null ? 'Create' : 'Save Changes')}
              </button>
              <button type="button" className="btn-outline" onClick={cancelForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <div className="state-message">Loading blog posts…</div>}
      {!loading && error && <div className="state-message error">{error}</div>}
      {!loading && !error && posts.length === 0 && (
        <div className="state-message">No blog posts found.</div>
      )}
      {!loading && !error && posts.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Slug</th>
                <th>Lang</th>
                <th>Category</th>
                <th>Status</th>
                <th>Published At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id}>
                  <td className="col-id">{post.id}</td>
                  <td>{post.title}</td>
                  <td>{post.slug}</td>
                  <td>{post.language}</td>
                  <td>{post.category ?? '—'}</td>
                  <td>
                    <span className={`status-badge ${post.isPublished ? 'status-confirmed' : 'status-pending'}`}>
                      {post.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>{post.publishedAt ? post.publishedAt.split('T')[0] : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn-xs edit" onClick={() => openEdit(post)}>Edit</button>
                      <button
                        className={`btn-xs ${post.isPublished ? 'deactivate' : 'activate'}`}
                        onClick={() => handleTogglePublish(post)}
                      >
                        {post.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
