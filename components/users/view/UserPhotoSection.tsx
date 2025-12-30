import { Icons } from '@/config/icons';

interface UserPhotoSectionProps {
  photoURL: string;
}

export default function UserPhotoSection({ photoURL }: UserPhotoSectionProps) {
  if (!photoURL) return null;

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold text-primary font-heading mb-4">
        Profile Photo
      </h3>
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.images size={20} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-secondary font-body mb-2">Photo URL</p>
            <p className="text-sm text-primary font-body break-all mb-3">
              {photoURL}
            </p>
            <a
              href={photoURL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80 font-medium transition-colors"
            >
              <Icons.globe size={16} />
              Open in new tab
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
