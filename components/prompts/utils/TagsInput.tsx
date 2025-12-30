import { Icons } from '@/config/icons';

interface TagsInputProps {
  tags: string[];
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function TagsInput({
  tags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  onKeyDown,
}: TagsInputProps) {
  return (
    <div>
      <label
        htmlFor="tags"
        className="block text-sm font-semibold text-primary mb-2 font-body"
      >
        Tags <span className="text-secondary/50">(Optional)</span>
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          id="tags"
          value={tagInput}
          onChange={(e) => onTagInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="flex-1 px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          placeholder="Enter a tag and press Enter or click Add"
        />
        <button
          type="button"
          onClick={onAddTag}
          className="px-6 py-3 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary/90 transition-all"
        >
          Add Tag
        </button>
      </div>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-accent/20 text-primary border border-accent/30"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="hover:text-secondary transition-colors"
              >
                <Icons.close size={16} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
