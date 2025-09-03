"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit,
  Eye,
  EyeOff,
  MoreHorizontal,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleVisibility?: () => void;
  onCreate?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  isVisible?: boolean;
  isLoading?: boolean;
  showCreate?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showToggleVisibility?: boolean;
  showSave?: boolean;
  showCancel?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  className?: string;
  deleteConfirmMessage?: string;
  deleteConfirmTitle?: string;
}

// 개별 액션 버튼들 - 접근성 강화
export function EditButton({
  onClick,
  size = "sm",
  variant = "outline",
  disabled,
}: {
  onClick: () => void;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  disabled?: boolean;
}) {
  return (
    <Button
      onClick={onClick}
      size={size}
      variant={variant}
      disabled={disabled}
      aria-label="편집"
      title="편집"
    >
      <Edit className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">편집</span>
    </Button>
  );
}

export function DeleteButton({
  onClick,
  size = "sm",
  variant = "outline",
  disabled,
}: {
  onClick: () => void;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  disabled?: boolean;
}) {
  return (
    <Button
      onClick={onClick}
      size={size}
      variant={variant}
      disabled={disabled}
      className="text-destructive hover:text-destructive focus:text-destructive"
      aria-label="삭제"
      title="삭제"
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">삭제</span>
    </Button>
  );
}

export function ToggleVisibilityButton({
  onClick,
  isVisible,
  size = "sm",
  variant = "outline",
  disabled,
}: {
  onClick: () => void;
  isVisible: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  disabled?: boolean;
}) {
  const actionLabel = isVisible ? "비공개로 전환" : "공개로 전환";
  const currentState = isVisible ? "현재 공개 상태" : "현재 비공개 상태";

  return (
    <Button
      onClick={onClick}
      size={size}
      variant={variant}
      disabled={disabled}
      aria-label={`${actionLabel} - ${currentState}`}
      title={actionLabel}
      aria-pressed={isVisible}
    >
      {isVisible ? (
        <EyeOff className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Eye className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="sr-only">{actionLabel}</span>
    </Button>
  );
}

// 액션 버튼 그룹
export function ActionButtons({
  onEdit,
  onDelete,
  onToggleVisibility,
  onCreate,
  onSave,
  onCancel,
  isVisible,
  isLoading = false,
  showCreate = false,
  showEdit = true,
  showDelete = true,
  showToggleVisibility = false,
  showSave = false,
  showCancel = false,
  size = "sm",
  variant = "outline",
  className = "",
  deleteConfirmMessage = "정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
  deleteConfirmTitle = "삭제 확인",
}: ActionButtonsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    onDelete?.();
    setShowDeleteDialog(false);
  };

  // 기본 액션 버튼들 (드롭다운 없이)
  if (
    !showDelete &&
    !showToggleVisibility &&
    showEdit &&
    !showCreate &&
    !showSave &&
    !showCancel
  ) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {showCreate && onCreate && (
          <Button onClick={onCreate} size={size} variant={variant}>
            <Plus className="h-4 w-4 mr-2" />
            생성
          </Button>
        )}
        {showEdit && onEdit && (
          <EditButton onClick={onEdit} size={size} variant={variant} />
        )}
        {showSave && onSave && (
          <Button onClick={onSave} size={size} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            저장
          </Button>
        )}
        {showCancel && onCancel && (
          <Button onClick={onCancel} size={size} variant="ghost">
            <X className="h-4 w-4 mr-2" />
            취소
          </Button>
        )}
      </div>
    );
  }

  // 복잡한 액션들은 드롭다운으로
  return (
    <>
      <div className={`flex items-center space-x-2 ${className}`}>
        {showCreate && onCreate && (
          <Button onClick={onCreate} size={size} variant={variant}>
            <Plus className="h-4 w-4 mr-2" />
            생성
          </Button>
        )}

        {showSave && onSave && (
          <Button onClick={onSave} size={size} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            저장
          </Button>
        )}

        {showCancel && onCancel && (
          <Button onClick={onCancel} size={size} variant="ghost">
            <X className="h-4 w-4 mr-2" />
            취소
          </Button>
        )}

        {(showEdit || showDelete || showToggleVisibility) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={variant}
                size={size}
                aria-label="더 많은 액션 메뉴"
                aria-haspopup="menu"
                aria-expanded="false"
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">더 많은 액션</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" role="menu" aria-label="액션 메뉴">
              {showEdit && onEdit && (
                <DropdownMenuItem
                  onClick={onEdit}
                  role="menuitem"
                  aria-label="편집"
                  className="focus:bg-accent focus:text-accent-foreground"
                >
                  <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
                  편집
                </DropdownMenuItem>
              )}

              {showToggleVisibility && onToggleVisibility && (
                <DropdownMenuItem
                  onClick={onToggleVisibility}
                  role="menuitem"
                  aria-label={isVisible ? "비공개로 전환" : "공개로 전환"}
                  className="focus:bg-accent focus:text-accent-foreground"
                >
                  {isVisible ? (
                    <EyeOff className="mr-2 h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                  )}
                  {isVisible ? "비공개로 전환" : "공개로 전환"}
                </DropdownMenuItem>
              )}

              {showDelete && onDelete && (
                <>
                  <DropdownMenuSeparator role="separator" />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    role="menuitem"
                    aria-label="삭제"
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                    삭제
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{deleteConfirmTitle}</DialogTitle>
            <DialogDescription>{deleteConfirmMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              취소
            </Button>
            <Button onClick={confirmDelete} variant="destructive">
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// 게시물 전용 액션 버튼들
export function PostActionButtons({
  postId,
  isOwner,
  isPublished,
  onEdit,
  onDelete,
  onTogglePublish,
  className,
}: {
  postId: string;
  isOwner: boolean;
  isPublished: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onTogglePublish?: () => void;
  className?: string;
}) {
  if (!isOwner) return null;

  return (
    <ActionButtons
      onEdit={onEdit}
      onDelete={onDelete}
      onToggleVisibility={onTogglePublish}
      isVisible={isPublished}
      showToggleVisibility={true}
      className={className}
      deleteConfirmMessage="게시물을 삭제하시겠습니까? 모든 댓글이 함께 삭제됩니다."
      deleteConfirmTitle="게시물 삭제"
    />
  );
}

// 댓글 전용 액션 버튼들
export function CommentActionButtons({
  commentId,
  isOwner,
  onEdit,
  onDelete,
  className,
}: {
  commentId: string;
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}) {
  if (!isOwner) return null;

  return (
    <ActionButtons
      onEdit={onEdit}
      onDelete={onDelete}
      showToggleVisibility={false}
      className={className}
      deleteConfirmMessage="댓글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      deleteConfirmTitle="댓글 삭제"
    />
  );
}
