import { Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "../ui/Button";

interface FormActionsProps {
    editing: boolean;
    saving: boolean;
    deleting: boolean;
    onDeleteOrCancel: () => void;
}

/** Submit plus delete (when editing) or cancel (when creating). */
export const FormActions = ({
    editing,
    saving,
    deleting,
    onDeleteOrCancel,
}: FormActionsProps) => (
    <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" variant="secondary" disabled={saving}>
            {editing ? (
                <Save className="size-5" aria-hidden />
            ) : (
                <Plus className="size-5" aria-hidden />
            )}
            {editing ? "Salvar" : "Adicionar"}
        </Button>
        <Button
            variant={editing ? "primary" : "ghost"}
            onClick={onDeleteOrCancel}
            disabled={deleting}
        >
            {editing ? (
                <Trash2 className="size-5" aria-hidden />
            ) : (
                <X className="size-5" aria-hidden />
            )}
            {editing ? "Deletar" : "Cancelar"}
        </Button>
    </div>
);
