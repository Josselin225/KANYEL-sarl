from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from content.models import ContactMessage, JobApplication, PropertyVisitRequest, QuoteRequest
from content.notifications import notify_admin


class Command(BaseCommand):
    help = "Sends a weekly summary email of new leads received over the past 7 days."

    def handle(self, *args, **options):
        since = timezone.now() - timedelta(days=7)

        messages = list(ContactMessage.objects.filter(created_at__gte=since))
        quotes = list(QuoteRequest.objects.filter(created_at__gte=since))
        visits = list(PropertyVisitRequest.objects.filter(created_at__gte=since))
        applications = list(JobApplication.objects.filter(created_at__gte=since))

        total = len(messages) + len(quotes) + len(visits) + len(applications)
        if total == 0:
            self.stdout.write("Aucune nouvelle demande cette semaine — e-mail non envoyé.")
            return

        lines = [
            "Résumé des 7 derniers jours — KANYEL SARL",
            "",
            f"Messages de contact : {len(messages)}",
            f"Demandes de devis : {len(quotes)}",
            f"Demandes de visite : {len(visits)}",
            f"Candidatures : {len(applications)}",
        ]

        if messages:
            lines += ["", "— Messages —"]
            lines += [f"  • {m.name} : {m.subject or 'Sans objet'}" for m in messages]
        if quotes:
            lines += ["", "— Devis —"]
            lines += [
                f"  • {q.full_name} ({q.department.title_fr if q.department else 'Devis général'})"
                for q in quotes
            ]
        if visits:
            lines += ["", "— Visites —"]
            lines += [
                f"  • {v.full_name} ({v.property.title_fr if v.property else 'Bien supprimé'})"
                for v in visits
            ]
        if applications:
            lines += ["", "— Candidatures —"]
            lines += [
                f"  • {a.full_name} ({a.job.title_fr if a.job else 'Candidature spontanée'})"
                for a in applications
            ]

        notify_admin("Résumé hebdomadaire — KANYEL SARL", "\n".join(lines))
        self.stdout.write(self.style.SUCCESS(f"Résumé envoyé ({total} élément(s))."))
