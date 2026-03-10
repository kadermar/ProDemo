"""Helper functions for S3 operations using boto3."""

import json
import logging
import os

import boto3

logger = logging.getLogger(__name__)


def list_pdf_keys(bucket: str, prefix: str) -> list[str]:
    """List all .pdf objects under prefix in the given S3 bucket.

    Args:
        bucket: S3 bucket name.
        prefix: S3 key prefix to search under.

    Returns:
        List of S3 keys ending in .pdf.
    """
    s3 = boto3.client("s3")
    keys: list[str] = []
    paginator = s3.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
        for obj in page.get("Contents", []):
            key: str = obj["Key"]
            if key.lower().endswith(".pdf"):
                keys.append(key)
    logger.info("Found %d PDF keys under s3://%s/%s", len(keys), bucket, prefix)
    return keys


def download_to_temp(bucket: str, key: str, tmp_dir: str) -> str:
    """Download an S3 object to a local temp directory.

    Args:
        bucket: S3 bucket name.
        key: S3 object key.
        tmp_dir: Local directory to download into.

    Returns:
        Absolute local path of the downloaded file.
    """
    s3 = boto3.client("s3")
    basename = os.path.basename(key)
    local_path = os.path.join(tmp_dir, basename)
    logger.debug("Downloading s3://%s/%s -> %s", bucket, key, local_path)
    s3.download_file(bucket, key, local_path)
    return local_path


def upload_json(bucket: str, key: str, data: dict) -> None:
    """Serialize data as JSON and upload to S3.

    Args:
        bucket: S3 bucket name.
        key: S3 destination key.
        data: Dictionary to serialize and upload.
    """
    s3 = boto3.client("s3")
    body = json.dumps(data, indent=2, ensure_ascii=False).encode("utf-8")
    s3.put_object(
        Bucket=bucket,
        Key=key,
        Body=body,
        ContentType="application/json",
    )
    logger.debug("Uploaded JSON to s3://%s/%s (%d bytes)", bucket, key, len(body))


def download_json(bucket: str, key: str) -> dict:
    """Download and parse a JSON file from S3.

    Args:
        bucket: S3 bucket name.
        key: S3 object key pointing to a JSON file.

    Returns:
        Parsed dictionary from the JSON content.
    """
    s3 = boto3.client("s3")
    response = s3.get_object(Bucket=bucket, Key=key)
    body = response["Body"].read()
    data: dict = json.loads(body)
    logger.debug("Downloaded JSON from s3://%s/%s", bucket, key)
    return data


def list_json_keys(bucket: str, prefix: str) -> list[str]:
    """List all .json objects under prefix in the given S3 bucket.

    Args:
        bucket: S3 bucket name.
        prefix: S3 key prefix to search under.

    Returns:
        List of S3 keys ending in .json.
    """
    s3 = boto3.client("s3")
    keys: list[str] = []
    paginator = s3.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
        for obj in page.get("Contents", []):
            key: str = obj["Key"]
            if key.lower().endswith(".json"):
                keys.append(key)
    logger.info("Found %d JSON keys under s3://%s/%s", len(keys), bucket, prefix)
    return keys
