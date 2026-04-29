from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from miProyecto.models import VaultEntry
from miProyecto.models.user_profile import UserProfile
from miProyecto.serializers import VaultEntrySerializer

FREE_PLAN_LIMIT = 3


class VaultEntryViewSet(ModelViewSet):
    serializer_class = VaultEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return VaultEntry.objects.filter(user=self.request.user).order_by("title")

    def perform_create(self, serializer):
        user = self.request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if not profile.is_pro:
            count = VaultEntry.objects.filter(user=user).count()
            if count >= FREE_PLAN_LIMIT:
                raise PermissionDenied("free_plan_limit")
        serializer.save(user=user)
