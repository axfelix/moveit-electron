"""
GUI tool to create a Bag from a filesystem folder.
"""

import sys
import os
import shutil
import bagit
from time import strftime
from distutils.dir_util import copy_tree
import tempfile
import zerorpc

class MoveIt(object):
    def bag_package(self, contactname, department, email, phone, creator, rrsda, agreement, title, datefrom, dateto, description, metadata, package_folder):
        bag_dir_parent = tempfile.mkdtemp()
        if os.path.isdir(bag_dir_parent):
            shutil.rmtree(bag_dir_parent)
        bag_dir = os.path.join(bag_dir_parent, 'bag')
        os.makedirs(bag_dir)
        copy_tree(os.path.normpath(package_folder.strip('"')), bag_dir)

        try:
            bag = bagit.make_bag(bag_dir, None, 1, ['sha256'])
            bag.info['Transfer-Time'] = strftime("%Y-%m-%d %H:%M:%S")
            bag.info['Bag-Software-Agent'] = "SFU MoveIt"
            bag.info['Contact-Name'] = contactname
            bag.info['Contact-Organization'] = department
            bag.info['Contact-Email'] = email
            bag.info['Contact-Phone'] = phone
            bag.info['Source-Organization'] = creator
            bag.info['RRSDA-Number'] = rrsda
            bag.info['Donation-Agreement'] = agreement
            bag.info['External-Identifier'] = title
            bag.info['Year-Start'] = datefrom
            bag.info['Year-End'] = dateto
            bag.info['External-Description'] = description
            bag.info['Other-Available-Metadata'] = metadata
            bag.save()
        except (bagit.BagError, Exception) as e:
            return False

        bag_destination = os.path.join(str(bag_dir_parent), (title))
        zipname = shutil.make_archive(bag_destination, 'zip', bag_dir)
        shutil.rmtree(bag_dir)

        desktopPath = os.path.expanduser("~/Desktop/")
        shutil.move(zipname, os.path.join(desktopPath, os.path.basename(zipname)))
        return True

if __name__ == '__main__':
    s = zerorpc.Server(MoveIt())
    s.bind('tcp://127.0.0.1:' + str(sys.argv[1]))
    s.run()