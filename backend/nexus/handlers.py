
from django.http import JsonResponse
from django.views.defaults import (
    bad_request,
    permission_denied,
    page_not_found,
    server_error,
)


def _is_api_request(request):
    return request.path.startswith("/api/")


def handler400(request, exception):
    if _is_api_request(request):
        return JsonResponse(
            {"detail": "Bad request."},
            status=400,
        )
    return bad_request(request, exception)


def handler403(request, exception):
    if _is_api_request(request):
        return JsonResponse(
            {"detail": "Permission denied."},
            status=403,
        )
    return permission_denied(request, exception)


def handler404(request, exception):
    if _is_api_request(request):
        return JsonResponse(
            {"detail": "API endpoint not found."},
            status=404,
        )
    return page_not_found(request, exception)


def handler500(request):
    if _is_api_request(request):
        return JsonResponse(
            {"detail": "An unexpected server error occurred."},
            status=500,
        )
    return server_error(request)
