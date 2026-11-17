"""Chiffrement AES-256-GCM en flux des archives de sauvegarde.

Format du fichier :  MAGIC | chunk*   où chaque chunk est
    longueur (4 octets, big-endian) | nonce (12 octets) | texte chiffré+tag
L'index du chunk et un indicateur « dernier chunk » sont liés comme données
associées : les chunks ne peuvent être réordonnés, supprimés ou tronqués sans détection.
"""

import base64
import os
import struct

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

MAGIC = b"KANYELBK1"
CHUNK_SIZE = 4 * 1024 * 1024  # 4 Mo
ENV_VAR = "BACKUP_ENCRYPTION_KEY"


class BackupKeyError(Exception):
    pass


def generate_key():
    return base64.urlsafe_b64encode(AESGCM.generate_key(bit_length=256)).decode()


def load_key():
    raw = os.environ.get(ENV_VAR, "").strip()
    if not raw:
        raise BackupKeyError(
            f"{ENV_VAR} manquant dans .env — impossible de chiffrer/déchiffrer les sauvegardes."
        )
    try:
        key = base64.urlsafe_b64decode(raw)
    except ValueError:
        key = b""
    if len(key) != 32:
        raise BackupKeyError(f"{ENV_VAR} invalide (clé AES-256 en base64 attendue).")
    return key


def _aad(index, last):
    return struct.pack(">Q?", index, last)


def encrypt_file(src_path, dst_path, key):
    aes = AESGCM(key)
    with open(src_path, "rb") as src, open(dst_path, "wb") as dst:
        dst.write(MAGIC)
        index = 0
        chunk = src.read(CHUNK_SIZE)
        while True:
            next_chunk = src.read(CHUNK_SIZE)
            last = not next_chunk
            nonce = os.urandom(12)
            sealed = aes.encrypt(nonce, chunk, _aad(index, last))
            dst.write(struct.pack(">I", len(sealed)) + nonce + sealed)
            if last:
                break
            chunk, index = next_chunk, index + 1


def decrypt_file(src_path, dst_path, key):
    aes = AESGCM(key)
    with open(src_path, "rb") as src, open(dst_path, "wb") as dst:
        if src.read(len(MAGIC)) != MAGIC:
            raise ValueError("Ce fichier n'est pas une sauvegarde KANYEL chiffrée.")
        index = 0
        header = src.read(4)
        while header:
            (length,) = struct.unpack(">I", header)
            nonce = src.read(12)
            sealed = src.read(length)
            header = src.read(4)
            last = not header
            # Lève InvalidTag en cas de mauvaise clé ou de toute altération/troncature.
            dst.write(aes.decrypt(nonce, sealed, _aad(index, last)))
            index += 1
